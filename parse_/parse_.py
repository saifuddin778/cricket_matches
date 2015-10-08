import sys, os, json
from time import time as tm
from collections import namedtuple

class parse_(object):
    """THE great parsing object"""
    def __init__(self):
        self.data_dir = '../data/'
        self.target_dir = '../processed/'
        self.match = namedtuple('match', ['team', 'result', 'margin', 'balls_remaining', 'toss', 'bat', 'null', 'location', 'date', 'month', 'year', 'match_type', 'opposition'])
        self.data = {}
    
    def process(self):
        """reading all the data in one walk"""
        t1 = tm()
        for root, directories, files in os.walk(self.data_dir):
            for filename in files:
                filepath = os.path.join(root, filename)
                f = open(filepath, 'rb')
                data = self.makes_(f)
                for i in data:
                    if i.team in self.data:
                        if i.opposition in self.data[i.team]:
                            if i.match_type in self.data[i.team][i.opposition]:
                                self.data[i.team][i.opposition][i.match_type].append(
                                    i._asdict()
                                )
                            else:
                                self.data[i.team][i.opposition][i.match_type] = []
                                self.data[i.team][i.opposition][i.match_type].append(
                                    i._asdict()
                                )
                        else:
                            self.data[i.team][i.opposition] = {}
                            self.data[i.team][i.opposition][i.match_type] = []
                            self.data[i.team][i.opposition][i.match_type].append(
                                i._asdict()
                            )
                    else:
                        self.data[i.team] = {}
                        self.data[i.team][i.opposition] = {}
                        self.data[i.team][i.opposition][i.match_type] = []
                        self.data[i.team][i.opposition][i.match_type].append(
                            i._asdict()
                        )
                f.close()
        
        file_saved = self.saves_(self.data)
        t2 = tm()
        print "%s saved .." % file_saved
        print "total time taken to process the files .. %f secs .. " % float(t2-t1)
        return
    
    def makes_(self, file_):
        """parses and generates a named tuple for the match record"""
        for line in file_:
            line = line.split('\t')[:-1]
            #--date is presented as day month year
            date_item = line[9].split(' ')
            opp_mat = line[7].split(' v ')
            
            line.append(int(date_item[0]))
            line.append(date_item[1])
            line.append(int(date_item[2]))
            
            line.append(opp_mat[0])
            line.append(opp_mat[1])
            
            del line[7], line[8]
            yield self.match._make(line)
    
    def saves_(self, data):
        """saves the processed file for all the teams"""
        file_saved = '%sdata.json' % self.target_dir
        f = open(file_saved, 'wb')
        f.write(json.dumps(data))
        f.close()
        return file_saved
    
parse_().process()